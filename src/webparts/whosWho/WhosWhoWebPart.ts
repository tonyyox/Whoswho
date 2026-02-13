import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { MSGraphClientV3 } from '@microsoft/sp-http';

import WhosWho from './components/WhosWho';
import { IWhosWhoProps } from './components/IWhosWhoProps';
import * as strings from 'WhosWhoWebPartStrings';

export interface IWhosWhoWebPartProps {
  title: string;
}

export default class WhosWhoWebPart extends BaseClientSideWebPart<IWhosWhoWebPartProps> {

  private _graphClient: MSGraphClientV3;

  protected async onInit(): Promise<void> {
    await super.onInit();
    this._graphClient = await this.context.msGraphClientFactory.getClient('3');
  }

  public render(): void {
    const element: React.ReactElement<IWhosWhoProps> = React.createElement(
      WhosWho,
      {
        graphClient: this._graphClient,
        title: this.properties.title || "Who's Who",
        displayMode: this.displayMode,
        onTitleUpdate: (value: string) => {
          this.properties.title = value;
        }
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Web Part Title'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
