

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-40b222da","ko-case-select-field":"ko-case-select-field-44c0076f","ko-cases-list":"ko-cases-list-cd3ddc53","ko-context-modal":"ko-context-modal-d262ea97","ko-datepicker":"ko-datepicker-2b8514f4","ko-editable-text":"ko-editable-text-2301d7d0","ko-feed":"ko-feed-2e98e589","ko-page-container":"ko-page-container-9d010b46","ko-pagination":"ko-pagination-23697890","ko-search":"ko-search-0edfb6cb","ko-sidebar":"ko-sidebar-ea2e67b6","login":"login-72a20b5a","session/cases/index":"session--cases--index-646ca1eb","session/showcase":"session--showcase-5f28baa6"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
