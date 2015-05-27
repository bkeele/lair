/* globals Meteor RouteController Session Subs ProjectController */
ProjectController = RouteController.extend({ // eslint-disable-line
  onRun: function () {
    if (this.params.id) {
      Session.set('projectId', this.params.id)
    }
    if (this.params.hid) {
      Session.set('hostId', this.params.hid)
    }
    this.next()
  },
  waitOn: function () {
    return [
      Subs.subscribe('project', this.params.id),
      Subs.subscribe('hosts', this.params.id),
      Subs.subscribe('ports', this.params.id),
      Subs.subscribe('issues', this.params.id),
      Subs.subscribe('people', this.params.id),
      Subs.subscribe('settings')
    ]
  }
})
