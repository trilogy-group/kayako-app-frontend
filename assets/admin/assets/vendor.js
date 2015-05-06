

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-97bae5c7","ko-case-select-field":"ko-case-select-field-f3f0aee0","ko-cases-list":"ko-cases-list-88e57a81","ko-context-modal":"ko-context-modal-e2e579f7","ko-editable-text":"ko-editable-text-a7bfb335","ko-feed":"ko-feed-871d84c7","ko-page-container":"ko-page-container-c9aa8a36","ko-pagination":"ko-pagination-f315ab3d","ko-search":"ko-search-24fabdff","ko-sidebar":"ko-sidebar-5f1baeb7","login":"login-d071732a","session/cases/index":"session--cases--index-2487e146","session/showcase":"session--showcase-45b21a3c"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
