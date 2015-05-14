

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-0145d5d1","ko-case-checkbox-field":"ko-case-checkbox-field-043411d4","ko-case-select-field":"ko-case-select-field-f3e133f0","ko-cases-list":"ko-cases-list-b3667208","ko-context-modal":"ko-context-modal-518be73f","ko-datepicker":"ko-datepicker-a4ff03e9","ko-editable-text":"ko-editable-text-8ebbf259","ko-feed":"ko-feed-9ee19430","ko-info-bar":"ko-info-bar-5f9132d8","ko-page-container":"ko-page-container-a62f414d","ko-pagination":"ko-pagination-3a0e3bab","ko-search":"ko-search-da9f04ce","ko-sidebar":"ko-sidebar-142275e3","ko-tab":"ko-tab-f935ba56","login":"login-e891a7b6","session/cases/index":"session--cases--index-5aaf0622","session/showcase":"session--showcase-dedbb0dc"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
