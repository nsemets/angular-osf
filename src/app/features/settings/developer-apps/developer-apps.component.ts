import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';

@Component({
  selector: 'osf-developer-apps',
  imports: [Button, Card],
  templateUrl: './developer-apps.component.html',
  styleUrl: './developer-apps.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeveloperAppsComponent {
  developerApplications: string[] = [
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
    'Developer app name example',
  ];

  onDeleteDeveloperApp(developerApp: string): void {
    console.log('delete', developerApp);
    //TODO implement api integration
  }
}
