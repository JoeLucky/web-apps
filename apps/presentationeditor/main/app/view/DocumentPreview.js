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
 *  DocumentPreview.js
 *
 *  Created by Julia Radzhabova on 4/18/14
 *  Copyright (c) 2014 Ascensio System SIA. All rights reserved.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'common/main/lib/component/BaseView',
    'presentationeditor/main/app/model/Pages'
], function () {
    'use strict';

    function _updatePagesCaption(model,value,opts) {
        var curr = model.get('current'),
            cnt = model.get('count');
        $('#preview-label-slides').text(
            Common.Utils.String.format(this.slideIndexText, (curr<cnt) ? curr : cnt , cnt) );
    }

    PE.Views.DocumentPreview = Common.UI.BaseView.extend(_.extend({
        el: '#pe-preview',

        // Delegated events for creating new items, and clearing completed ones.
        events: {
        },

        options: {
            alias: 'DocumentPreview'
        },

        initialize : function(options) {
            _.extend(this.options, options || {});

            this.template = [
                '<div id="presentation-preview" style="width:100%; height:100%"></div>',
                '<div id="preview-controls-panel" class="preview-controls" style="position: absolute; bottom: 0;">',
                    '<div class="preview-group" style="">',
                        '<button id="btn-preview-prev" type="button" class="btn small btn-toolbar"><span class="btn-icon">&nbsp;</span></button>',
                        '<button id="btn-preview-play" type="button" class="btn small btn-toolbar"><span class="btn-icon">&nbsp;</span></button>',
                        '<button id="btn-preview-next" type="button" class="btn small btn-toolbar"><span class="btn-icon">&nbsp;</span></button>',
                    '<div class="separator"/>',
                    '</div>',
                    '<div class="preview-group dropup">',
                        '<label id="preview-label-slides" class="status-label" data-toggle="dropdown">Slide 1 of 1</label>',
                        '<div id="preview-goto-box" class="dropdown-menu">',
                            '<label style="float:left;line-height:22px;">' + this.goToSlideText + '</label>',
                            '<div id="preview-goto-page" style="display:inline-block;"></div>',
                        '</div>',
                    '</div>',
                    '<div class="preview-group" style="">',
                        '<div class="separator"/>',
                        '<button id="btn-preview-fullscreen" type="button" class="btn small btn-toolbar"><span class="btn-icon">&nbsp;</span></button>',
                        '<div class="separator fullscreen"/>',
                        '<button id="btn-preview-close" type="button" class="btn small btn-toolbar"><span class="btn-icon">&nbsp;</span></button>',
                    '</div>',
                '</div>'
            ].join('');

            this.pages = new PE.Models.Pages({current:1, count:1});
            this.pages.on('change', _.bind(_updatePagesCaption,this));
        },

        render: function () {
            var el = $(this.el),
                me = this;
            el.html(_.template(this.template, {
                scope: this
            }));

            this.btnPrev = new Common.UI.Button({
                el: $('#btn-preview-prev',this.el),
                hint: this.txtPrev,
                hintAnchor: 'top'
            });
            this.btnPrev.on('click', _.bind(function() {
                if (this.api) this.api.DemonstrationPrevSlide();
            }, this));

            this.btnNext = new Common.UI.Button({
                el: $('#btn-preview-next',this.el),
                hint: this.txtNext,
                hintAnchor: 'top'
            });
            this.btnNext.on('click', _.bind(function() {
                if (this.api) this.api.DemonstrationNextSlide();
            }, this));

            this.btnPlay = new Common.UI.Button({
                el: $('#btn-preview-play',this.el),
                hint: this.txtPlay,
                hintAnchor: 'top'
            });
            this.btnPlay.on('click', _.bind(function(btn) {
                var iconEl = $('.btn-icon', this.btnPlay.cmpEl);
                if (iconEl.hasClass('btn-pause')) {
                    iconEl.removeClass('btn-pause');
                    this.btnPlay.updateHint(this.txtPlay);
                    if (this.api)
                        this.api.DemonstrationPause();
                } else {
                    iconEl.addClass('btn-pause');
                    this.btnPlay.updateHint(this.txtPause);
                    if (this.api)
                        this.api.DemonstrationPlay ();
                }
            }, this));

            this.btnClose = new Common.UI.Button({
                el: $('#btn-preview-close',this.el),
                hint: this.txtClose,
                hintAnchor: 'top'
            });
            this.btnClose.on('click', _.bind(function() {
                if (this.api) this.api.EndDemonstration();
            }, this));

            this.btnFullScreen = new Common.UI.Button({
                el: $('#btn-preview-fullscreen',this.el),
                hint: this.txtFullScreen,
                hintAnchor: 'top'
            });
            this.btnFullScreen.on('click', _.bind(function(btn) {
                this.toggleFullScreen();
            }, this));

            this.txtGoToPage = new Common.UI.InputField({
                el          : $('#preview-goto-page'),
                allowBlank  : true,
                validateOnChange: true,
                style       : 'width: 60px;',
                maskExp: /[0-9]/,
                validation  : function(value) {
                    if (/(^[0-9]+$)/.test(value)) {
                        value = parseInt(value);
                        if (undefined !== value && value > 0 && value <= me.pages.get('count'))
                            return true;
                    }

                    return me.txtPageNumInvalid;
                }
            }).on('keypress:after', function(input, e) {
                    var box = me.$el.find('#preview-goto-box');
                    if (e.keyCode === Common.UI.Keys.RETURN) {
                        var edit = box.find('input[type=text]'), page = parseInt(edit.val());
                        if (!page || page-- > me.pages.get('count') || page < 0) {
                            edit.select();
                            return false;
                        }

                        box.focus();                        // for IE
                        box.parent().removeClass('open');

                        me.api.DemonstrationGoToSlide(page);
                        me.api.asc_enableKeyEvents(true);

                        return false;
                    }
                }
            );

            var goto = this.$el.find('#preview-goto-box');
            goto.on('click', function() {
                return false;
            });
            goto.parent().on('show.bs.dropdown',
                function () {
//                    me.txtGoToPage.setValue(me.api.getCurrentPage() + 1);
//                    me.txtGoToPage.checkValidate();
                    var edit = me.txtGoToPage.$el.find('input');
                    _.defer(function(){edit.focus(); edit.select();}, 100);

                }
            );
            goto.parent().on('hide.bs.dropdown',
                function () { var box = me.$el.find('#preview-goto-box');
                    if (me.api && box) {
                        box.focus();                        // for IE
                        box.parent().removeClass('open');

                        me.api.asc_enableKeyEvents(true);
                    }
                }
            );
            $(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange",function(){
                var fselem = (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement );
                me.btnFullScreen.cmpEl.toggleClass('fullscreen', fselem !== undefined && fselem !== null);

                if (Common.Utils.isIE) { // for tooltips in IE
                    me.btnFullScreen.updateHint( fselem ? '' : me.txtFullScreen);
                    me.btnPrev.updateHint( fselem ? '' : me.txtPrev);
                    me.btnPlay.updateHint( fselem ? '' : ($('.btn-icon', me.btnPlay.cmpEl).hasClass('btn-pause') ? me.txtPause : me.txtPlay));
                    me.btnNext.updateHint( fselem ? '' : me.txtNext);
                    me.btnClose.updateHint( fselem ? '' : me.txtClose);
                } else
                    me.btnFullScreen.updateHint( fselem ? me.txtExitFullScreen: me.txtFullScreen);
            });

            if (Common.Utils.isIE) {
                el.find('.preview-controls').css('opacity', '0.4');
            }

            this.separatorFullScreen = el.find('.separator.fullscreen');
        },

        show: function() {
            var toolbar = PE.getController('Toolbar').getView('Toolbar');
            if (toolbar._state.hasCollaborativeChanges) {
                toolbar._state.hasCollaborativeChanges = false;
                if (toolbar.synchTooltip) toolbar.synchTooltip.hide();
                toolbar.needShowSynchTip = true;
            }

            Common.UI.BaseView.prototype.show.call(this,arguments);

            var iconEl = $('.btn-icon', this.btnPlay.cmpEl);
            if (!iconEl.hasClass('btn-pause')) {
                iconEl.addClass('btn-pause');
                this.btnPlay.updateHint(this.txtPause);
            }
            $('#viewport-vbox-layout').css('z-index','0');
            this.fireEvent('editcomplete', this);
        },

        hide: function() {
            Common.UI.BaseView.prototype.hide.call(this,arguments);

            $('#viewport-vbox-layout').css('z-index','auto');
            Common.NotificationCenter.trigger('layout:changed', 'preview');

            var toolbar = PE.getController('Toolbar').getView('Toolbar');
            if (toolbar.needShowSynchTip) {
                toolbar.needShowSynchTip = false;
                toolbar.onCollaborativeChanges();
            }

            this.fireEvent('editcomplete', this);
        },

        setApi: function(o) {
            this.api = o;

            if (this.api) {
                this.api.asc_registerCallback('asc_onCountPages',   _.bind(this.onCountSlides, this));
                this.api.asc_registerCallback('asc_onEndDemonstration',  _.bind(this.onEndDemonstration, this));
                this.api.asc_registerCallback('asc_onDemonstrationSlideChanged',  _.bind(this.onDemonstrationSlideChanged, this));
                this.api.DemonstrationEndShowMessage(this.txtFinalMessage);
            }
            return this;
        },

        setMode: function(mode) {
            this.mode = mode;
            if (this.mode.isDesktopApp) {
                this.btnFullScreen.setVisible(false);
                this.separatorFullScreen.hide();
                $(document).off("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange");
            }
            return this;
        },

        onCountSlides: function(count){
            this.pages.set('count', count);
        },

        onDemonstrationSlideChanged: function(slideNum) {
            this.pages.set('current', slideNum+1);
            if (this.api && _.isNumber(slideNum)) {
                var count = this.api.getCountPages();
                if (count !== this.pages.get('count'))
                    this.pages.set('count', count);
                this.btnPrev.setDisabled(slideNum<=0);
                this.btnNext.setDisabled(slideNum>=count-1);
                this.txtGoToPage.setValue(slideNum + 1);
                this.txtGoToPage.checkValidate();
            }
        },

        onEndDemonstration: function( ) {
            this.hide();
            this.fullScreenCancel();
        },

        toggleFullScreen: function() {
            if (!document.fullscreenElement && !document.msFullscreenElement && 
                !document.mozFullScreenElement && !document.webkitFullscreenElement) {
                this.fullScreen(document.documentElement);
            } else {
                this.fullScreenCancel();
            }
        },

        fullScreen: function(element) {
            if (this.mode.isDesktopApp) return;
            if (element) {
                if(element.requestFullscreen) {
                    element.requestFullscreen();
                } else if(element.webkitRequestFullscreen) {
                    element.webkitRequestFullscreen();
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if(element.msRequestFullscreen) {
                    element.msRequestFullscreen();
                }
            }
        },

        fullScreenCancel: function () {
            if (this.mode.isDesktopApp) return;
            if(document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if(document.webkitCancelFullScreen ) {
                document.webkitCancelFullScreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        },

        txtPrev: 'Previous Slide',
        txtNext: 'Next Slide',
        txtClose: 'Close Preview',
        goToSlideText    : 'Go to Slide',
        slideIndexText   : 'Slide {0} of {1}',
        txtPlay: 'Start Presentation',
        txtPause: 'Pause Presentation',
        txtFinalMessage: 'The end of slide preview. Click to exit.',
        txtPageNumInvalid: 'Slide number invalid',
        txtFullScreen: 'Full Screen',
        txtExitFullScreen: 'Exit Full Screen'
    }, PE.Views.DocumentPreview || {}));
});