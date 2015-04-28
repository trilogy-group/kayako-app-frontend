

Ember.COMPONENT_CSS_LOOKUP = {"ko-cases-list":"ko-cases-list-4da7acc4","ko-context-modal":"ko-context-modal-e5263839","ko-editable-text":"ko-editable-text-200b62e0","ko-feed":"ko-feed-33081547","ko-search":"ko-search-f62eada3","ko-sidebar":"ko-sidebar-08d09d40","ko-tabs":"ko-tabs-0847b02e","login":"login-6cc5811f","session/cases/index":"session--cases--index-a43243b8","session/showcase":"session--showcase-2fd1fc62"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
