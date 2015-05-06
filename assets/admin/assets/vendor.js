

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-411bfa27","ko-case-select-field":"ko-case-select-field-948743e9","ko-cases-list":"ko-cases-list-d53a92a8","ko-context-modal":"ko-context-modal-f3b29920","ko-editable-text":"ko-editable-text-3dc53d16","ko-feed":"ko-feed-8ae2526d","ko-page-container":"ko-page-container-353e5816","ko-search":"ko-search-541d22f8","ko-sidebar":"ko-sidebar-8adfbc1f","login":"login-7eee1c54","session/cases/index":"session--cases--index-73c1e88e","session/showcase":"session--showcase-2dde9985"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
