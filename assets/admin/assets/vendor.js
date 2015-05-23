

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-34fe077b","ko-case-checkbox-field":"ko-case-checkbox-field-5ebca3a6","ko-case-select-field":"ko-case-select-field-b90720e5","ko-cases-list":"ko-cases-list-a8a0f284","ko-context-modal":"ko-context-modal-022c9c6e","ko-datepicker":"ko-datepicker-30e246e6","ko-draggable-dropzone":"ko-draggable-dropzone-5bfc5084","ko-editable-text":"ko-editable-text-b355523a","ko-feed":"ko-feed-86f062c8","ko-info-bar":"ko-info-bar-ce0624ff","ko-page-container":"ko-page-container-f7f674fa","ko-pagination":"ko-pagination-b85ae425","ko-search":"ko-search-7d90dc57","ko-sidebar":"ko-sidebar-9fdf8c07","ko-tab":"ko-tab-a06095a3","ko-text-editor":"ko-text-editor-cbc455ce","login":"login-e38dd615","session/cases/index":"session--cases--index-1ce13d70","session/showcase":"session--showcase-56795869"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
