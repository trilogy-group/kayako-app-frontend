

Ember.COMPONENT_CSS_LOOKUP = {"ko-cases-list":"ko-cases-list-1e28f80d","ko-context-modal":"ko-context-modal-5419090a","ko-editable-text":"ko-editable-text-66d35f93","ko-feed":"ko-feed-591e4b24","ko-search":"ko-search-0b7594dc","ko-sidebar":"ko-sidebar-0cc7f68a","ko-tabs":"ko-tabs-7323fc79","login":"login-51de0c6c","session/cases/index":"session--cases--index-ece54bf8","session/showcase":"session--showcase-3f61aead"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
