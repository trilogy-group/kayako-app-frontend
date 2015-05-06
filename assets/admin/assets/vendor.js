

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-671707b4","ko-case-select-field":"ko-case-select-field-600b0aa6","ko-cases-list":"ko-cases-list-7a35a73f","ko-context-modal":"ko-context-modal-bbb1f380","ko-editable-text":"ko-editable-text-f71cd531","ko-feed":"ko-feed-6d426ff4","ko-page-container":"ko-page-container-85aa3572","ko-search":"ko-search-97ec5e06","ko-sidebar":"ko-sidebar-25fec73e","login":"login-ee8d895e","session/cases/index":"session--cases--index-cd1b539a","session/showcase":"session--showcase-a74e741a"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
