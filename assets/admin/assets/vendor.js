

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-ce8db47d","ko-case-checkbox-field":"ko-case-checkbox-field-9b8c3581","ko-case-select-field":"ko-case-select-field-ae5f9584","ko-cases-list":"ko-cases-list-6ba701f9","ko-context-modal":"ko-context-modal-d6644529","ko-datepicker":"ko-datepicker-3fabe773","ko-draggable-dropzone":"ko-draggable-dropzone-a5be3dda","ko-editable-text":"ko-editable-text-4f229e01","ko-feed":"ko-feed-4c67f35a","ko-info-bar":"ko-info-bar-67e7a485","ko-page-container":"ko-page-container-9d630d52","ko-pagination":"ko-pagination-9d32cc38","ko-search":"ko-search-b43f251c","ko-sidebar":"ko-sidebar-b34f08e8","ko-tab":"ko-tab-bd37aa41","ko-text-editor":"ko-text-editor-a173ba75","login":"login-e06d52cd","session/cases/index":"session--cases--index-da53696c","session/showcase":"session--showcase-d931b46c"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
