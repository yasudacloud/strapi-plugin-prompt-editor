import { getTranslation } from './utils/getTranslation';
import { Initializer } from './components/Initializer';
import pluginPkg from '../../package.json';
import PluginIcon from './components/PluginIcon';

const name = pluginPkg.strapi.name;
const pluginId = 'prompt-editor';

export default {
  register(app: any) {
    app.customFields.register({
      name,
      type: 'richtext',
      pluginId,
      icon: PluginIcon,
      intlLabel: {
        id: getTranslation('app.title'),
        defaultMessage: 'Prompt Editor',
      },
      intlDescription: {
        id: getTranslation('app.about'),
        defaultMessage: 'A stylish editor enhanced by AI integration with Strapi.',
      },
      components: {
        Input: async () =>
          import('./components/Editor').then((module) => ({
            default: module.Editor,
          })),
      },
      options: {
        base: [],
        advanced: [
          {
            sectionTitle: null,
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: getTranslation('app.required.label'),
                  defaultMessage: 'Required field',
                },
                description: {
                  id: getTranslation('app.required.description'),
                  defaultMessage: 'Editor Required Entries',
                },
              },
            ],
          },
        ],
      },
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      name,
    });

    app.createSettingSection(
      {
        id: pluginId,
        intlLabel: {
          id: `${pluginId}.app.title`,
          defaultMessage: 'Prompt Editor',
        },
      },
      [
        {
          intlLabel: {
            id: `${pluginId}.setting.name`,
            defaultMessage: 'Editor Setting',
          },
          id: 'setting',
          to: `/settings/${pluginId}`,
          Component: async () => {
            return import('./pages/Setting');
          },
        },
      ]
    );
  },
  async registerTrads(app: any) {
    const { locales } = app;
    const importedTranslations = await Promise.all(
      (locales as string[]).map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data,
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );
    return importedTranslations;
  },
};
