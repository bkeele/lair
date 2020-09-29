/* globals Meteor Accounts check Matchers Projects Hosts Services Issues WebDirectories Settings*/

Meteor.methods({
  createLairUser: createLairUser,
  removeLairUser: removeLairUser,
  changeLairUserPassword: changeLairUserPassword,
  toggleLairUserIsAdmin: toggleLairUserIsAdmin,
  toggleClientSideUpdates: toggleClientSideUpdates,
  togglePersistViewFilters: togglePersistViewFilters,
  setViewIncrement: setViewIncrement,
  saveWorfSettings: saveWorfSettings
})

function createLairUser (email, password, isAdmin) {
  if (Meteor.users.find().count() !== 0) {
    if (!Meteor.user().isAdmin) {
      throw new Meteor.Error(403, 'Only admins may create new users')
    }
  }
  isAdmin = isAdmin || false
  check(email, Matchers.isEmail)
  check(password, Matchers.isNonEmptyString)
  return Accounts.createUser({
    email: email,
    password: password,
    isAdmin: isAdmin
  })
}

function removeLairUser (id) {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Only admins may delete users')
  }
  check(id, Matchers.isObjectId)
  Projects.update({
    contributors: id
  }, {
    $pull: {
      contributors: id
    }
  })
  var projects = Projects.find({
    owner: id
  }, {
    fields: {
      _id: 1
    }
  }).fetch()
  projects.forEach(function (id) {
    Hosts.remove({projectId: id})
    Services.remove({projectId: id})
    WebDirectories.remove({projectId: id})
    Issues.remove({projectId: id})
  })
  Projects.remove({owner: id})
  return Meteor.users.remove(id)
}

function toggleLairUserIsAdmin (id) {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  check(id, Matchers.isObjectId)
  var user = Meteor.users.findOne({
    _id: id
  })
  if (!user) {
    throw new Meteor.Error(404, 'User not found')
  }
  if (user.isAdmin) {
    if (Meteor.users.find({}).count() < 2) {
      throw new Meteor.Error(400, 'Must have at least 1 admin user')
    }
    return Meteor.users.update({
      _id: id
    }, {
      $set: {
        isAdmin: false
      }
    })
  }
  return Meteor.users.update({
    _id: id
  }, {
    $set: {
      isAdmin: true
    }
  })
}
function changeLairUserPassword (id, password) {
  if (!Meteor.user().isAdmin && id !== this.userId) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  check(id, Matchers.isObjectId)
  check(password, Matchers.isNonEmptyString)
  return Accounts.setPassword(id, password)
}

function toggleClientSideUpdates () {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var setting = Settings.findOne({setting: 'allowClientSideUpdates'})
  if (typeof setting === 'undefined') {
    return Settings.insert({setting: 'allowClientSideUpdates', enabled: true})
  } else if (setting.enabled === false) {
    return Settings.update({setting: 'allowClientSideUpdates'}, {$set: {enabled: true}})
  } else {
    return Settings.update({'setting': 'allowClientSideUpdates'}, {$set: {enabled: false}})
  }
}

function togglePersistViewFilters () {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var setting = Settings.findOne({setting: 'persistViewFilters'})
  if (typeof setting === 'undefined') {
    return Settings.insert({setting: 'persistViewFilters', enabled: true})
  } else if (setting.enabled === false) {
    return Settings.update({setting: 'persistViewFilters'}, {$set: {enabled: true}})
  } else {
    return Settings.update({setting: 'persistViewFilters'}, {$set: {enabled: false}})
  }
}

function setViewIncrement (numItems) {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  numItems = parseInt(numItems, 10)
  check(numItems, Matchers.isPositiveInteger)
  return Settings.upsert({setting: 'numViewItems'}, {$set: {value: numItems}})
}

function saveWorfSettings(url,username,password) {
  if (!Meteor.user().isAdmin) {
    throw new Meteor.Error(403, 'Access Denied')
  }
  var setting = Settings.findOne({setting: 'worfUrl'})
  if (typeof setting === 'undefined') {
    Settings.insert({setting: 'worfUrl', value: url})
  } else {
    Settings.update({setting: 'worfUrl'}, {$set: { value: url}})
  }
  setting = Settings.findOne({setting: 'worfUsername'})
  if (typeof setting === 'undefined') {
    Settings.insert({setting: 'worfUsername', value: username})
  } else {
    Settings.update({setting: 'worfUsername'}, {$set: { value: username}})
  }
  setting = Settings.findOne({setting: 'worfPassword'})
  if (typeof setting === 'undefined') {
    Settings.insert({setting: 'worfPassword', value: password})
  } else {
    Settings.update({setting: 'worfPassword'}, {$set: { value: password}})
  }

  return
}
