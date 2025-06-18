from django.conf import settings
from drf_yasg import openapi


schemas = {
    'LLM_CALLBACK_SCHEMA': {
        'POST': dict(
            method='post',
            operation_summary="LLM Service Callback",
            operation_description="""
            This endpoint is called by the LLM microservice when Q&A generation is complete.

            It accepts:
            - **task_id**: ID of the task
            - **markdown_content**: Q&A results as a markdown string

            ⚠️ This endpoint is internal and not intended for external use.
            """,
            request_body=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                required=['task_id', 'markdown_content'],
                properties={
                    'task_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='ID of the QA generation task'),
                    'markdown_content': openapi.Schema(type=openapi.TYPE_STRING, description='Q&A result in markdown format'),
                }
            ),
            responses={
                200: openapi.Response(description="Successfully saved markdown result."),
                400: openapi.Response(description="Missing task_id or markdown_content"),
                404: openapi.Response(description="Task not found"),
                409: openapi.Response(description="Task not in PROCESSING state"),
                500: openapi.Response(description="Unexpected error or failure saving result")
            },
        )
    },

    'QAGenerationTaskAPIViewSchema': {
        'CREATE': dict(
            operation_summary="Create a QA Generation Task",
            operation_description="""
                Creates a new Q&A generation task for a given topic.  
                Only one active task is allowed per topic at a time.

                Once created, the task is sent to the LLM service asynchronously.  
                The status field will be initially set to **PENDING**, then updated via WebSocket.

                - **topic** must belong to the authenticated user
                - Only one **PENDING/PROCESSING** task per topic is allowed at a time
                - Status=**PENDING** is when the task that has been created but not yet passed to the LLM service
                - Status=**PROCESSING** is when the task is currently being processed by the LLM service
                - Status=**SUCCESS** is when the task has been successfully processed. It also shows that the markdown Q&A file is available
                - Status=**FAILED** is when the task has failed. In this case, the **error_message** field will contain the reason for the failure
                - In case of **SUCCESS** or **FAILED**, you can retrive the details of each task from related endpoint
                - The **status** of the tasks is being broadcasted via WebSocket, so you can listen to the changes in real-time
                """,
            responses={
                "200": openapi.Response(
                    description="Successfully passed the task to the LLM service",
                    examples={
                        'application/json': {
                            "id": "id",
                            "topic": "topic_id",
                            "status": f'{settings.PENDING} or {settings.PROCESSING} or {settings.SUCCESS} or {settings.FAILED}',
                        }
                    }
                ),
                400: openapi.Response(description="Validation error",),
                409: openapi.Response(description="A task is already in progress for this topic",)
            }
        ),
        'LIST': dict(
            operation_summary="List QA Generation Tasks",
            operation_description="Returns all Q&A generation tasks for the authenticated user.",
            responses={
                "200": openapi.Response(
                    description="Successfully retrieved the Q&A tasks.",
                    examples={
                        'application/json': [
                            {
                                "id": "id",
                                "topic": "topic_id",
                                "status": "String",
                                "result_file": "markdown_file_url(if available)"
                            },
                            {
                                "id": "id",
                                "topic": "topic_id",
                                "status": "String",
                                "result_file": "markdown_file_url(if available)"
                            },
                        ]
                    }
                )
            }
        ),
        'RETRIEVE': dict(
            operation_summary="Retrieve a QA Generation Task",
            operation_description="Returns the Q&A generation task for the authenticated user.",
            responses={
                "200": openapi.Response(
                    description="Successfully retrieved the Q&A task.",
                    examples={
                        'application/json': 
                            {
                                "id": "id",
                                "topic": "topic_id",
                                "status": "string",
                                "result_file": "markdown_file_url(if available)"
                            },
                    }
                )
            }
        )
    }
}



