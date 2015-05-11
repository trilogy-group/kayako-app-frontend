

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-b5cfd6c1","ko-case-select-field":"ko-case-select-field-fa5c7608","ko-cases-list":"ko-cases-list-e816c555","ko-context-modal":"ko-context-modal-e46ec09b","ko-datepicker":"ko-datepicker-5e700da6","ko-editable-text":"ko-editable-text-9efaf1c9","ko-feed":"ko-feed-f04bce97","ko-page-container":"ko-page-container-25d0222f","ko-pagination":"ko-pagination-235cddc9","ko-search":"ko-search-81aa7f55","ko-sidebar":"ko-sidebar-01fade91","login":"login-ddb29b09","session/cases/index":"session--cases--index-dbc60362","session/showcase":"session--showcase-a5a746b6"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
