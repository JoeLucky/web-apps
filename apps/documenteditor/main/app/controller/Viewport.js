/*
 *
 * (c) Copyright Ascensio System Limited 2010-2016
 *
 * This program is freeware. You can redistribute it and/or modify it under the terms of the GNU 
 * General Public License (GPL) version 3 as published by the Free Software Foundation (https://www.gnu.org/copyleft/gpl.html).
 * In accordance with Section 7(a) of the GNU GPL its Section 15 shall be amended to the effect that 
 * Ascensio System SIA expressly excludes the warranty of non-infringement of any third-party rights.
 *
 * THIS PROGRAM IS DISTRIBUTED WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR
 * FITNESS FOR A PARTICULAR PURPOSE. For more details, see GNU GPL at https://www.gnu.org/copyleft/gpl.html
 *
 * You can contact Ascensio System SIA by email at sales@onlyoffice.com
 *
 * The interactive user interfaces in modified source and object code versions of ONLYOFFICE must display 
 * Appropriate Legal Notices, as required under Section 5 of the GNU GPL version 3.
 *
 * Pursuant to Section 7  3(b) of the GNU GPL you must retain the original ONLYOFFICE logo which contains 
 * relevant author attributions when distributing the software. If the display of the logo in its graphic 
 * form is not reasonably feasible for technical reasons, you must include the words "Powered by ONLYOFFICE" 
 * in every copy of the program you distribute.
 * Pursuant to Section 7  3(e) we decline to grant you any rights under trademark law for use of our trademarks.
 *
*/
/**
 *  Viewport.js
 *
 *  This is out main controller which will do most of job
 *  It will listen for view and collection events and manage all data-related operations
 *
 *  Created by Alexander Yuzhin on 1/15/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'core',
    'common/main/lib/view/Header',
    'documenteditor/main/app/view/Viewport',
    'documenteditor/main/app/view/LeftMenu'
], function (Viewport) {
    'use strict';

    DE.Controllers.Viewport = Backbone.Controller.extend({
        // Specifying a Viewport model
        models: [],

        // Specifying a collection of out Viewport
        collections: [],

        // Specifying application views
        views: [
            'Viewport',   // is main application layout
            'Common.Views.Header'
        ],

        // When controller is created let's setup view event listeners
        initialize: function() {
            // This most important part when we will tell our controller what events should be handled
        },

        setApi: function(api) {
            this.api = api;
        },


        // When our application is ready, lets get started
        onLaunch: function() {
            // Create and render main view
            this.viewport = this.createView('Viewport').render();
            this.header   = this.createView('Common.Views.Header', {
                headerCaption: 'Document Editor'
            }).render();

            Common.NotificationCenter.on('layout:changed', _.bind(this.onLayoutChanged, this));
            $(window).on('resize', _.bind(this.onWindowResize, this));

            var leftPanel = $('#left-menu'),
                histPanel = $('#left-panel-history');
            this.viewport.hlayout.on('layout:resizedrag', function() {
                this.api.Resize();
                Common.localStorage.setItem('de-mainmenu-width', histPanel.is(':visible') ? (histPanel.width()+SCALE_MIN) : leftPanel.width() );
            }, this);

            this.boxSdk = $('#editor_sdk');
            this.boxSdk.css('border-left', 'none');
        },

        onLayoutChanged: function(area) {
            switch (area) {
            default:
                this.viewport.vlayout.doLayout();
            case 'rightmenu':
                this.viewport.hlayout.doLayout();
                break;
            case 'history':
                var panel = this.viewport.hlayout.items[1];
                if (panel.resize.el) {
                    this.boxSdk.css('border-left', '');
                    panel.resize.el.show();
                }
                this.viewport.hlayout.doLayout();
                break;
            case 'leftmenu':
                var panel = this.viewport.hlayout.items[0];
                if (panel.resize.el) {
                    if (panel.el.width() > 40) {
                        this.boxSdk.css('border-left', '');
                        panel.resize.el.show();
                    } else {
                        panel.resize.el.hide();
                        this.boxSdk.css('border-left', '0 none');
                    }
                }
                this.viewport.hlayout.doLayout();
                break;
            case 'header':
            case 'toolbar':
            case 'status':
                this.viewport.vlayout.doLayout();
                break;
            }
            this.api.Resize();
        },

        onWindowResize: function(e) {
            this.onLayoutChanged('window');
        }
    });
});
