

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-d775b4d0","ko-case-select-field":"ko-case-select-field-56ee6a51","ko-cases-list":"ko-cases-list-afcdeaf4","ko-context-modal":"ko-context-modal-264e6a57","ko-editable-text":"ko-editable-text-b6913dce","ko-feed":"ko-feed-abce9afb","ko-page-container":"ko-page-container-4b8a51d0","ko-pagination":"ko-pagination-495b7abc","ko-search":"ko-search-0c0f879c","ko-sidebar":"ko-sidebar-7737d0d4","login":"login-b38dd783","session/cases/index":"session--cases--index-96d7e7ad","session/showcase":"session--showcase-915e5a37"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
