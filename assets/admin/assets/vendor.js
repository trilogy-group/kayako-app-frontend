

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-ca9044e6","ko-case-checkbox-field":"ko-case-checkbox-field-f756c54b","ko-case-select-field":"ko-case-select-field-79004698","ko-cases-list":"ko-cases-list-876fe2d2","ko-context-modal":"ko-context-modal-bfa9ba7a","ko-datepicker":"ko-datepicker-1db5a135","ko-editable-text":"ko-editable-text-90a1f55e","ko-feed":"ko-feed-80d331be","ko-info-bar":"ko-info-bar-3c5eab0f","ko-page-container":"ko-page-container-983a505c","ko-pagination":"ko-pagination-be2860a9","ko-search":"ko-search-e9437b37","ko-sidebar":"ko-sidebar-fee7e7b1","ko-tab":"ko-tab-b75ff912","login":"login-690de5d5","session/cases/index":"session--cases--index-e81985cb","session/showcase":"session--showcase-f6d14761"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
