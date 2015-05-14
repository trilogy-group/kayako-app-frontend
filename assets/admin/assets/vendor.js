

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-14e46e8f","ko-case-select-field":"ko-case-select-field-8ea5c164","ko-cases-list":"ko-cases-list-5d088210","ko-context-modal":"ko-context-modal-e5c21390","ko-datepicker":"ko-datepicker-868bae9e","ko-editable-text":"ko-editable-text-5eeb4fde","ko-feed":"ko-feed-033060b9","ko-page-container":"ko-page-container-634e7569","ko-pagination":"ko-pagination-5a00c968","ko-search":"ko-search-7dcad32c","ko-sidebar":"ko-sidebar-1a2684ea","ko-tab":"ko-tab-463da8ed","login":"login-89fb9de4","session/cases/index":"session--cases--index-b4bb8afe","session/showcase":"session--showcase-57861900"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
