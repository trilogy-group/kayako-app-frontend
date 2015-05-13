

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-f39da234","ko-case-checkbox-field":"ko-case-checkbox-field-2dad602c","ko-case-select-field":"ko-case-select-field-fb628e90","ko-cases-list":"ko-cases-list-69e91439","ko-context-modal":"ko-context-modal-2d41af7e","ko-datepicker":"ko-datepicker-8b4e5f48","ko-editable-text":"ko-editable-text-5d12cad0","ko-feed":"ko-feed-f43040c6","ko-info-bar":"ko-info-bar-480feafc","ko-page-container":"ko-page-container-0cd01174","ko-pagination":"ko-pagination-f92d9746","ko-search":"ko-search-e26886bf","ko-sidebar":"ko-sidebar-82c52183","login":"login-810fc0d4","session/cases/index":"session--cases--index-d9ffbef6","session/showcase":"session--showcase-f3c28339"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
