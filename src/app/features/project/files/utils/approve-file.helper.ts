import { environment } from 'src/environments/environment';

export function approveFile(fileId: string, projectId: string): void {
  const link = `${environment.apiUrlV1}/${projectId}/files/${fileId}/`;

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = link;

  // Optionally clean up the iframe after it's done
  iframe.onload = () => {
    setTimeout(() => iframe.remove(), 3000); // wait just in case redirects
  };

  document.body.appendChild(iframe);
}
