

Ember.COMPONENT_CSS_LOOKUP = {"ko-cases-list":"ko-cases-list-63fcb27c","ko-context-modal":"ko-context-modal-c8101ad7","ko-editable-text":"ko-editable-text-888f9d50","ko-feed":"ko-feed-417357bf","ko-pagination":"ko-pagination-80b75ec5","ko-search":"ko-search-95c4cef0","ko-sidebar":"ko-sidebar-f81523f0","ko-tabs":"ko-tabs-cc8af8bb","login":"login-7ab7016f","session/cases/index":"session--cases--index-6e9a4377","session/showcase":"session--showcase-558d2008"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
