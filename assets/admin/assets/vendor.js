

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-342e1c93","ko-case-checkbox-field":"ko-case-checkbox-field-81aef82a","ko-case-select-field":"ko-case-select-field-112f2640","ko-cases-list":"ko-cases-list-83ea991c","ko-context-modal":"ko-context-modal-37945082","ko-datepicker":"ko-datepicker-a390b22d","ko-editable-text":"ko-editable-text-416f0b5b","ko-feed":"ko-feed-690d1959","ko-info-bar":"ko-info-bar-52cde987","ko-page-container":"ko-page-container-b01bdc0a","ko-pagination":"ko-pagination-f56ef43d","ko-search":"ko-search-4157439b","ko-sidebar":"ko-sidebar-ea2462c5","ko-tab":"ko-tab-f8dba9f7","login":"login-adcfcfc2","session/cases/index":"session--cases--index-52e780f5","session/showcase":"session--showcase-4e0c54eb"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
