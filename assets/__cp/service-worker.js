function makeCaseUrl(t){return t.currentTarget.origin+"/agent/cases/"+t.notification.data.id}function getActionsForNotification(t){return"case"===t.resource_type&&t.resource_id?[{action:"open-case",title:"Open case"}]:[]}self.addEventListener("notificationclick",function(t){if(""===t.action||"case"===t.notification.type){var i=makeCaseUrl(t)
clients.openWindow(i)}}),self.addEventListener("install",function(t){t.waitUntil(self.skipWaiting())}),self.addEventListener("push",function(t){if(t.data){var i=t.data.json()
if(i.title){var e=self.registration.showNotification(i.title,{body:i.summary,icon:i.avatar_url,data:{id:i.resource_id},type:i.resource_type})
t.waitUntil(e)}}})

//# sourceMappingURL=service-worker.map