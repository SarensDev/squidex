/*
 * Squidex Headless CMS
 * 
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved
 */

import * as Ng2 from '@angular/core';

import {
    AppLanguagesService,
    AppsStoreService,
    LanguageDto, 
    LanguageService,
    TitleService 
} from 'shared';

@Ng2.Component({
    selector: 'sqx-languages-page',
    styles,
    template
})
export class LanguagesPageComponent implements Ng2.OnInit {
    private appSubscription: any | null = null;
    private appName: string;

    public allLanguages: LanguageDto[] = null;
    public appLanguages: LanguageDto[] = [];
    public selectedLanguage: LanguageDto | null = null;

    public isSaving: boolean;

    public get newLanguages() {
        return this.allLanguages.filter(x => !this.appLanguages.find(l => l.iso2Code === x.iso2Code));
    }

    constructor(
        private readonly titles: TitleService,
        private readonly appsStore: AppsStoreService,
        private readonly appLanguagesService: AppLanguagesService,
        private readonly languagesService: LanguageService
    ) {
    }

    public ngOnInit() {
        this.languagesService.getLanguages().subscribe(languages => {
            this.allLanguages = languages;
        });

        this.appSubscription =
            this.appsStore.selectedApp.subscribe(app => {
                if (app) {
                    this.appName = app.name;

                    this.titles.setTitle('{appName} | Settings | Languages', { appName: app.name });

                    this.appLanguagesService.getLanguages(app.name).subscribe(appLanguages => {
                        this.appLanguages = appLanguages;
                    });
                }
            });
    }

    public ngOnDestroy() {
        this.appSubscription.unsubscribe();
    }

    public removeLanguage(language: LanguageDto) {
        this.appLanguages.splice(this.appLanguages.indexOf(language), 1);
    }

    public addLanguage() {
        this.appLanguages.push(this.selectedLanguage);

        this.selectedLanguage = null;
    }

    public saveLanguages() {
        this.isSaving = true;

        this.appLanguagesService.postLanguages(this.appName, this.appLanguages.map(l => l.iso2Code))
            .delay(500)
            .finally(() => {
                this.isSaving = false;
            })
            .subscribe();
    }
}
