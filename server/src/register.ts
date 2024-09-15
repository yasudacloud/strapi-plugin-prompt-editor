import {Strapi} from "@strapi/strapi";

const register = ({strapi}: { strapi: Strapi }) => {
  strapi.customFields.register({
    name: 'prompt-editor',
    plugin: 'prompt-editor',
    type: 'richtext'
  });
};

export default register;
