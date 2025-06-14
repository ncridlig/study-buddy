from django.contrib import admin
from results.models import QAGenerationTask


@admin.register(QAGenerationTask)
class QAGenerationTaskAdmin(admin.ModelAdmin):
    list_display = ('id', 'topic', 'status')