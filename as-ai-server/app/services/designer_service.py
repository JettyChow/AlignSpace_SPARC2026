from app.services import project_service


def list_designer_projects():
    all_projects = project_service.list_projects()["projects"]

    designer_projects = [
        project for project in all_projects
        if project.get("status") == "sent_to_designer"
    ]

    return {
        "projects": designer_projects
    }


def get_designer_project(project_id: int):
    project = project_service.get_project(project_id)

    return {
        "project_id": project_id,
        "project": project
    }