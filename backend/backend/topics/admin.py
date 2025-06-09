from django.contrib import admin
from topics.models import Topic, UploadedFile

@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin) :
    list_display = ('title', 'user')

    @admin.display(description='user')
    def related_test(self, obj) :
        return f'{obj.user}'


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('filename', 'topic_title', 'user', 'order')

    def topic_title(self, obj):
        return obj.topic.title
    topic_title.short_description = 'Topic'

    def user(self, obj):
        return obj.topic.user
    user.short_description = 'User'