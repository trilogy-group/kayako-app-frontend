

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-baf18a4e","ko-case-checkbox-field":"ko-case-checkbox-field-9070672d","ko-case-select-field":"ko-case-select-field-26bc4ef0","ko-cases-list":"ko-cases-list-e7c33f9e","ko-context-modal":"ko-context-modal-aa680fa1","ko-datepicker":"ko-datepicker-9025dc36","ko-editable-text":"ko-editable-text-2e74d9a7","ko-feed":"ko-feed-a536e4a0","ko-info-bar":"ko-info-bar-404048fb","ko-page-container":"ko-page-container-10ff4845","ko-pagination":"ko-pagination-bc262cfe","ko-search":"ko-search-572e0456","ko-sidebar":"ko-sidebar-d52a9762","ko-tab":"ko-tab-11f79ff4","login":"login-93e59c5a","session/cases/index":"session--cases--index-a248d84f","session/showcase":"session--showcase-daeaf99f"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
