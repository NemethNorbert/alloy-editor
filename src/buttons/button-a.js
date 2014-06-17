YUI.add('button-a', function (Y) {
    'use strict';

    var Lang = Y.Lang,
        YNode = Y.Node,

    A = Y.Base.create('a', Y.Plugin.Base, [Y.ButtonBase], {
        renderUI: function() {
            this._renderButtonUI();

            this._renderLinkUI();
        },

        bindUI: function() {
            this.onHostEvent('visibleChange', this._onVisibleChange, this);

            this._linkInput.on('keypress', this._onKeyPress, this);
            this._linkInput.on('valuechange', this._onValueChange, this);

            this._closeLink.on('click', this._onCloseClick, this);
            this._inputClear.on('click', this._onClearClick, this);
        },

        _getSelectedLink: function() {
            var editor,
                range,
                selection,
                selectedElement;

            editor = this.get('host').get('editor');

            selection = editor.getSelection();

            selectedElement = selection.getSelectedElement();

            if (selectedElement && selectedElement.is('a')) {
                return selectedElement;
            }

            range = selection.getRanges()[0];

            if (range) {
                range.shrink(CKEDITOR.SHRINK_TEXT);

                return editor.elementPath(range.getCommonAncestor()).contains('a', 1);
            }

            return null;
        },

        _createLink: function(URI) {
            var editor,
                range,
                selection,
                style,
                text;

            editor = this.get('host').get('editor');

            selection = editor.getSelection();

            range = selection.getRanges()[0];

            if (range.collapsed) {
                text = new CKEDITOR.dom.text(URI, editor.document);
                range.insertNode(text);
                range.selectNodeContents(text);
            }

            style = new CKEDITOR.style({
                attributes: {
                    'data-cke-saved-href': URI,
                    href: URI
                },
                element: this.get('element')
            });

            style.type = CKEDITOR.STYLE_INLINE;
            style.applyToRange(range, editor);
            range.select();
        },

        _onClearClick: function() {
            this._linkInput.set('value', '');

            this._linkInput.focus();

            this._inputClear.hide();
            this._closeLink.disable();
        },

        _onCloseClick: function() {
            this.get('host').hide();
        },

        _onClick: function(event) {
            var instance = this,
                btnInst,
                editor,
                linkInput,
                selection;

            btnInst = event.target;

            editor = instance.get('host').get('editor');

            if (btnInst.get('pressed')) {
                selection = editor.getSelection();

                instance._buttonsContainer.addClass('hide');
                instance._linkContainer.removeClass('hide');

                linkInput = instance._linkInput;

                linkInput.focus();

                instance._createLink('/');

                instance._link = instance._getSelectedLink();

                instance.onceHostEvent('visibleChange', instance._handleLink, instance);
            }
            else {
                instance._removeLink();
            }
        },

        _handleLink: function() {
            var link;

            link = this._linkInput.get('value');

            if (link) {
                this._updateLink(link);
            }
            else {
                this._removeLink();
            }

            this._linkInput.set('value', '');

            this._link = null;
        },

        _onKeyPress: function(event) {
            if (event.charCode === 13) {
                this.get('host').hide();
            }
        },

        _onValueChange: function(event) {
            if (event.newVal) {
                this._inputClear.show();

                this._closeLink.enable();
            }
            else {
                this._inputClear.hide();

                this._closeLink.disable();
            }
        },

        _onVisibleChange: function(event) {
            if (!event.newVal) {
                this._linkContainer.addClass('hide');
                this.get('host').get('buttonsContainer').removeClass('hide');

                this._inputClear.hide();
                this._closeLink.disable();
            }
        },

        _removeLink: function() {
            var editor,
                style;

            style = this._link || new CKEDITOR.style({
                alwaysRemoveElement: 1,
                element: 'a',
                type: CKEDITOR.STYLE_INLINE
            });

            editor = this.get('host').get('editor');

            editor.removeStyle(style);
        },

        _renderLinkUI: function() {
            var contentBox,
                linkContainer;

            linkContainer = YNode.create(
                Lang.sub(
                    this.TPL_LINK_CONTAINER, {
                        placeholder: this.get('strings').placeholder
                    }
                )
            );

            contentBox = this.get('host').get('contentBox');

            contentBox.appendChild(linkContainer);

            this._buttonsContainer = this.get('host').get('buttonsContainer');

            this._linkContainer = linkContainer;

            this._linkInput = linkContainer.one('input');

            this._inputClear = linkContainer.one('.input-clear i');

            this._inputClear.hide();

            this._closeLink = new Y.Button({
                disabled: true,
                render: linkContainer.one('.input-close-container'),
                srcNode: linkContainer.one('.close-link')
            });
        },

        _updateLink: function(URI) {
            var editor,
                style;

            editor = this.get('host').get('editor');

            style = this._link || this._getSelectedLink(editor);

            style.setAttributes({
                href: URI,
                'data-cke-saved-href': URI
            });
        },

        TPL_CONTENT: '<i class="icon-link"></i>',

        TPL_LINK_CONTAINER:
            '<div class="row link-wrapper hide">' +
                '<div class="pull-left input-wrapper">' +
                    '<span class="input-container">' +
                        '<input class="input-large" type="text" placeholder="{placeholder}"></input>' +
                        '<span class="input-clear">' +
                            '<i class="icon-remove"></i>' +
                        '</span>' +
                    '</span>' +
                '</div>' +
                '<div class="pull-right input-close-container">' +
                    '<button class="btn close-link"><i class="icon-ok"></i></button>' +
                '</div>' +
            '</div>'
    }, {
        NAME: 'a',

        NS: 'a',

        ATTRS: {
            element: {
                validator: Lang.isString,
                value: 'a'
            },

            strings: {
                value: {
                    placeholder: 'Type or paste link here'
                }
            }
        }
    });

    Y.ButtonA = A;

},'', {
    requires: ['button-base', 'event-valuechange']
});