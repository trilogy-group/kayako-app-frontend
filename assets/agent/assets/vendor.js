

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-990055b3","ko-case-checkbox-field":"ko-case-checkbox-field-a4b1b0fc","ko-case-select-field":"ko-case-select-field-6bfd67f1","ko-cases-list":"ko-cases-list-f008b7bf","ko-context-modal":"ko-context-modal-947a2059","ko-datepicker":"ko-datepicker-354eace2","ko-editable-text":"ko-editable-text-5ca7f31e","ko-feed":"ko-feed-529116f5","ko-info-bar":"ko-info-bar-deec71c1","ko-page-container":"ko-page-container-ffc39d36","ko-pagination":"ko-pagination-c7ad5bef","ko-search":"ko-search-05da2a2e","ko-sidebar":"ko-sidebar-cb28352e","ko-tab":"ko-tab-e79e0267","login":"login-95931bbe","session/cases/index":"session--cases--index-d6956c46","session/showcase":"session--showcase-0720f355"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
