import {Strapi} from "@strapi/strapi";
import {Readable} from "stream";

const image = ({strapi}: { strapi: Strapi }) => ({
  async blob(ctx) {
    const {
      state: {userAbility}
    } = ctx;

    const pm = strapi.admin.services.permission.createPermissionsManager({
      ability: userAbility,
      action: 'plugin::upload.assets.create',
      model: 'plugin::upload.file',
    });
    if (!pm.isAllowed) {
      return ctx.forbidden();
    }
    const {url, folderId} = JSON.parse(ctx.request.body)
    const response = await fetch(url)
    if (!response.ok) {
      ctx.throw(500, 'Failed to download image');
    }
    const buffer = await response.arrayBuffer()
    const fileStream = Readable.from(Buffer.from(buffer));
    const fileName = url.split('/').pop() || 'uploaded-file';

    // アップロード用のファイルオブジェクトを作成
    const file = {
      path: buffer,
      name: fileName,
      type: response.headers.get('content-type'),
      size: buffer.byteLength,
      stream: fileStream,
    };

    const uploadedFiles = await strapi
      .plugin('upload')
      .service('upload')
      .upload({
        data: {
          fileInfo: {
            name: "Name",
            caption: "Caption",
            alternativeText: "Alternative Text",
            folder: folderId ? folderId : undefined,
          },
        },
        files: file,
      });
    ctx.send(uploadedFiles);
  }
})

export default image
