

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-b355e87f","ko-case-checkbox-field":"ko-case-checkbox-field-37d5d924","ko-case-select-field":"ko-case-select-field-ae296822","ko-cases-list":"ko-cases-list-b5420036","ko-context-modal":"ko-context-modal-37fed0b1","ko-datepicker":"ko-datepicker-ea9da9c5","ko-draggable-dropzone":"ko-draggable-dropzone-136917f5","ko-editable-text":"ko-editable-text-36c06a30","ko-feed":"ko-feed-c3e71891","ko-info-bar":"ko-info-bar-4f394a4d","ko-page-container":"ko-page-container-e8cfe99f","ko-pagination":"ko-pagination-b3bfb711","ko-search":"ko-search-7bf24041","ko-sidebar":"ko-sidebar-b3f5cb40","ko-tab":"ko-tab-7715d37d","ko-text-editor":"ko-text-editor-93c7bf2b","login":"login-d785a71d","session/cases/index":"session--cases--index-7b7c4690","session/showcase":"session--showcase-1e446f16"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
