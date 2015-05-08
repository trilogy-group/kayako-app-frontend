

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-97a0f40c","ko-case-select-field":"ko-case-select-field-1a80bd5b","ko-cases-list":"ko-cases-list-47ef9de6","ko-context-modal":"ko-context-modal-d88051bf","ko-datepicker":"ko-datepicker-4dfe145a","ko-editable-text":"ko-editable-text-df563f3a","ko-feed":"ko-feed-b2f67872","ko-page-container":"ko-page-container-d398ef6e","ko-pagination":"ko-pagination-26d0840d","ko-search":"ko-search-fbf3fb25","ko-sidebar":"ko-sidebar-9a95e59d","login":"login-5237fffb","session/cases/index":"session--cases--index-b302888b","session/showcase":"session--showcase-5e1f20a8"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
