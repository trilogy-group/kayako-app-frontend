

Ember.COMPONENT_CSS_LOOKUP = {"ko-cases-list":"ko-cases-list-bbb272a4","ko-context-modal":"ko-context-modal-6d22fa1e","ko-editable-text":"ko-editable-text-2fd4ef9a","ko-feed":"ko-feed-f45db527","ko-search":"ko-search-c5a23bfb","ko-sidebar":"ko-sidebar-b544505a","ko-tabs":"ko-tabs-38efcd0d","login":"login-415300ff","session/cases/index":"session--cases--index-74e0dd76","session/showcase":"session--showcase-6759a36b"};
Ember.ComponentLookup.reopen({
  lookupFactory: function(name, container) {
    var Component = this._super(name, container);
    if (!Component) { return; }
    return Component.reopen({
      classNames: [Ember.COMPONENT_CSS_LOOKUP[name]]
    });
  }
});
