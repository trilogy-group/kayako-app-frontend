

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-d4e17ab6","ko-case-checkbox-field":"ko-case-checkbox-field-cd98b0ff","ko-case-metric":"ko-case-metric-25e45a4c","ko-case-select-field":"ko-case-select-field-b985f623","ko-cases-list":"ko-cases-list-c6a160a0","ko-contact-info":"ko-contact-info-e16aa8d4","ko-context-modal":"ko-context-modal-c1d88772","ko-datepicker":"ko-datepicker-e628f471","ko-draggable-dropzone":"ko-draggable-dropzone-f6dc2f52","ko-editable-text":"ko-editable-text-47f13626","ko-feed":"ko-feed-63d23343","ko-feedback":"ko-feedback-a1d40707","ko-info-bar":"ko-info-bar-b60f6093","ko-page-container":"ko-page-container-294f26c0","ko-pagination":"ko-pagination-194ea5f5","ko-recent-cases":"ko-recent-cases-8f437b0f","ko-search":"ko-search-2391bad6","ko-sidebar":"ko-sidebar-86a3165e","ko-tab":"ko-tab-026acf85","ko-text-editor":"ko-text-editor-ca8c75f4","login":"login-a4e6755e","session/cases/index":"session--cases--index-a3a5f11c","session/showcase":"session--showcase-f106bbae"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
