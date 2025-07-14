from drf_yasg import openapi

def auth_error():
    return {"401": openapi.Response(description="Authentication credentials were not provided")}

def not_found_error():
    return {"404": openapi.Response(description="Resource not found")}


schemas = {
    'TopicViewSetSchema' : {
        'CREATE' : dict(
            operation_summary="Create a new topic",
            operation_description="""
            Create a new Topic:

            - **title** (required): Title for the new topic.
            - **description** (optional): Description for the new topic.

            Topic validation:
            - Topics of each user should have a unique title.
            """,
            responses={
                "201": openapi.Response(
                    description="Topic created",
                    examples={
                        'application/json' : {
                            "id": "id",
                            "title": "string",
                            "description": "string"
                        }
                    }
                ),
                **auth_error(),
            }
        ),
        'LIST' : dict(
            operation_summary="List all of the existing topics",
            operation_description='List all of the existing topics for the authenticated user',
            responses={
                "200": openapi.Response(
                    description="All topics retrieved",
                    examples={
                        'application/json' : [
                                {
                                "id": "id",
                                "title": "string",
                                "description": "string"
                            },
                                {
                                "id": "id",
                                "title": "string",
                                "description": "string"
                            }
                        ]    
                    }
                ),
                **auth_error(),
            }
        ),
        'RETRIEVE' : dict(
            operation_summary="Retrieve one topic",
            operation_description='Retrieve the details of a topic with its id',
            responses={
                "200": openapi.Response(
                    description="Topic retrieved",
                    examples={
                        'application/json' : {
                                "id": "id",
                                "title": "string",
                                "description": "string"
                        },
                    }
                ),
                **auth_error(),
            }
        ),
        'UPDATE' : dict(
            operation_summary="Update an existing topic",
            operation_description="""
            Update features of an existing:

            - **title** (optional): new title to replace the old one.
            - **description** (optional): new description to replace the old one.

            Topic validation:
            - Uniquness of titles should not be violated.
            - If none of the above fields are provided, no changes will be made.
            """,
            responses={
                "200": openapi.Response(
                    description="Topic updated",
                    examples={
                        'application/json' : {
                                "id": "id",
                                "title": "string",
                                "description": "string"
                        },
                    }
                ),
                **auth_error(),
            }
        ),
        'DELETE' : dict(
            operation_summary="Delete (Archive) an existing topic",
            operation_description="""
            Delete (Archive) a topic with its id
            """,
            responses={
                "204": openapi.Response(
                    description="Topic Deleted(Archived)",
                ),
                **auth_error(),
            }
        ),
    },

    'UploadedFileViewSetSchema': {
        'CREATE': dict(
            operation_summary="Upload a file to a specific topic",
            operation_description="""
                Upload a file for a specific topic:

                - **file** (required): The file to upload. Allowed types defined in settings.
                - **order** (optional): Order in topic. Must be unique per topic if provided.

                File validation:

                - Allowed types are defined in `settings.ALLOWED_FILE_TYPES`.
                - Max file size is limited by `settings.ALLOWED_FILE_SIZE`.
                - Each topic can accept up to `settings.ALLOWED_NUMBER_OF_FILES`.
                """,
            manual_parameters=[
                openapi.Parameter(
                    name='file',
                    in_=openapi.IN_FORM,
                    type=openapi.TYPE_FILE,
                    required=True,
                    description='The file to upload',
                ),
                openapi.Parameter(
                    name='order',
                    in_=openapi.IN_FORM,
                    type=openapi.TYPE_INTEGER,
                    required=False,
                    description='Optional order number'
                )
            ],
            responses={
                "201": openapi.Response(
                    description="File uploaded successfully",
                    examples={
                        'application/json': {
                            "id": "id",
                            "filename": "example.pdf",
                            "order": 0,
                            "download_url": "/media/files/.../example.pdf"
                        }
                    }
                ),
                "400": openapi.Response(description="Validation error"),
                **auth_error(),
            }
        ),
        'LIST': dict(
            operation_summary="List all files in a topic",
            operation_description="Returns all files belonging to the authenticated user's topic (given by URL)",
            responses={
                "200": openapi.Response(
                    description="List of files",
                    examples={
                        'application/json': [
                            {
                                "id": "id",
                                "filename": "doc1.pdf",
                                "order": 0,
                                "download_url": "/media/files/.../doc1.pdf"
                            },
                            {
                                "id": "id",
                                "filename": "doc2.pdf",
                                "order": 1,
                                "download_url": "/media/files/.../doc2.pdf"
                            }
                        ]
                    }
                ),
                **auth_error(),
                **not_found_error()
            }
        ),
        'RETRIEVE': dict(
            operation_summary="Retrieve a single file",
            operation_description="Get a single uploaded file's details, including filename and order",
            responses={
                "200": openapi.Response(
                    description="File retrieved",
                    examples={
                        'application/json': {
                            "id": "id",
                            "filename": "example.pdf",
                            "order": 0,
                            "download_url": "/media/files/.../example.pdf"
                        }
                    }
                ),
                **auth_error(),
                **not_found_error()
            }
        ),
        'UPDATE': dict(
            operation_summary="Update a file's order or replace the file itself",
            operation_description="""
                Update a file:

                - If **file** is provided, the old file will be deleted and replaced.
                - If **order** is provided, it must not conflict with another file in the same topic.

                At least one of the above must be provided, otherwise there will be no change.
                """,
            manual_parameters=[
                openapi.Parameter(
                    name='file',
                    in_=openapi.IN_FORM,
                    type=openapi.TYPE_FILE,
                    required=False,
                    description='Replace the current file'
                ),
                openapi.Parameter(
                    name='order',
                    in_=openapi.IN_FORM,
                    type=openapi.TYPE_INTEGER,
                    required=False,
                    description='New order value'
                )
            ],
            responses={
                "200": openapi.Response(
                    description="File updated",
                    examples={
                        'application/json': {
                            "id": "id",
                            "filename": "updated.pdf",
                            "order": 1,
                            "download_url": "/media/files/1/topic-name/updated.pdf"
                        }
                    }
                ),
                "400": openapi.Response(description="Validation or integrity error"),
                **auth_error(),
                **not_found_error()
            }
        ),
        'DELETE': dict(
            operation_summary="Delete a file instance",
            operation_description="Delete the file record and remove the actual file from storage",
            responses={
                "204": openapi.Response(description="File deleted"),
                **auth_error(),
                **not_found_error()
            }
        )
    }

}