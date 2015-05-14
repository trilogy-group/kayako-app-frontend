

Ember.COMPONENT_CSS_LOOKUP = {"ko-breadcrumbs":"ko-breadcrumbs-342ff26a","ko-case-checkbox-field":"ko-case-checkbox-field-b5046110","ko-case-select-field":"ko-case-select-field-8bf9a64d","ko-cases-list":"ko-cases-list-c93d60d2","ko-context-modal":"ko-context-modal-25ecc863","ko-datepicker":"ko-datepicker-db9ad5cb","ko-editable-text":"ko-editable-text-6d270d00","ko-feed":"ko-feed-88ca05e5","ko-info-bar":"ko-info-bar-f219cf14","ko-page-container":"ko-page-container-0eb6775b","ko-pagination":"ko-pagination-236a6c56","ko-search":"ko-search-8c4dc4e5","ko-sidebar":"ko-sidebar-606658b2","ko-tab":"ko-tab-0128c02a","login":"login-958e92d4","session/cases/index":"session--cases--index-16101e3c","session/showcase":"session--showcase-c347d086"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
