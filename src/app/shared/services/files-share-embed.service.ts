import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Injectable } from '@angular/core';

import { ENVIRONMENT } from '@osf/core/provider/environment.provider';
import { embedDynamicJs, embedStaticHtml } from '@shared/constants/file-embed.constants';

import { FileModel } from '../models/files/file.model';
import { FileShareLink } from '../models/files/file-share-link.model';

@Injectable({
  providedIn: 'root',
})
export class FilesShareEmbedService {
  private readonly environment = inject(ENVIRONMENT);
  private readonly clipboard = inject(Clipboard);

  private readonly EMBED_PLACEHOLDER = 'ENCODED_URL';

  getShareLink(file: FileModel, shareType?: string): FileShareLink | null {
    const url = file.links?.html;
    const name = file.name;

    if (!url || !name) return null;

    const encodedUrl = encodeURIComponent(url);
    const encodedName = encodeURIComponent(name);

    switch (shareType) {
      case 'email':
        return {
          link: `mailto:?subject=${encodedName}&body=${encodedUrl}`,
          target: '_self',
        };
      case 'twitter':
        return {
          link: `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedName}&via=OSFramework`,
          target: '_blank',
        };
      case 'facebook': {
        const appId = this.environment.facebookAppId;
        return {
          link: `https://www.facebook.com/dialog/share?app_id=${appId}&display=popup&href=${encodedUrl}&redirect_uri=${encodedUrl}`,
          target: '_blank',
        };
      }
      default:
        return null;
    }
  }

  getEmbedHtml(file: FileModel, embedType?: string): string {
    switch (embedType) {
      case 'dynamic':
        return embedDynamicJs.replace(this.EMBED_PLACEHOLDER, file.links.render);
      case 'static':
        return embedStaticHtml.replace(this.EMBED_PLACEHOLDER, file.links.render);
      default:
        return '';
    }
  }

  copyToClipboard(value: string): boolean {
    return this.clipboard.copy(value);
  }
}
