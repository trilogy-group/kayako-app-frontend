

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-292767b7","ko-case-checkbox-field":"ko-case-checkbox-field-bbe50a4e","ko-case-select-field":"ko-case-select-field-6a2bd872","ko-cases-list":"ko-cases-list-40d264aa","ko-context-modal":"ko-context-modal-ecdaba43","ko-datepicker":"ko-datepicker-d16ce81b","ko-editable-text":"ko-editable-text-362191a7","ko-feed":"ko-feed-b5527ffe","ko-info-bar":"ko-info-bar-a658ded8","ko-page-container":"ko-page-container-df42445a","ko-pagination":"ko-pagination-1dbc9cf6","ko-search":"ko-search-237d2744","ko-sidebar":"ko-sidebar-27c8d9fc","ko-tab":"ko-tab-4cdd3653","login":"login-85f7e343","session/cases/index":"session--cases--index-877971a6","session/showcase":"session--showcase-e2457b1e"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
