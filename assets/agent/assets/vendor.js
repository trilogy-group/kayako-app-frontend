

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-590225ae","ko-case-checkbox-field":"ko-case-checkbox-field-03653d65","ko-case-select-field":"ko-case-select-field-d5d657f3","ko-cases-list":"ko-cases-list-86ddfdda","ko-context-modal":"ko-context-modal-934732fd","ko-datepicker":"ko-datepicker-0d941feb","ko-editable-text":"ko-editable-text-129edad0","ko-feed":"ko-feed-1b0e7671","ko-info-bar":"ko-info-bar-81c9a111","ko-page-container":"ko-page-container-52392ed6","ko-pagination":"ko-pagination-eb7646fe","ko-search":"ko-search-01d35639","ko-sidebar":"ko-sidebar-77f553eb","ko-tab":"ko-tab-f608d4b9","login":"login-67456a4e","session/cases/index":"session--cases--index-b45719c7","session/showcase":"session--showcase-e33de60d"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
