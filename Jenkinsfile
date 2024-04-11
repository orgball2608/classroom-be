pipeline {
    agent any

    environment {
        IMAGE_NAME = 'your_image_name' 
        DOCKERHUB_USERNAME = credentials('dockerhub-username')
        DOCKERHUB_TOKEN = credentials('dockerhub-token')
        RENDER_DEPLOY_HOOK_URL = credentials('render-deploy-hook-url')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and push Docker image') {
            steps {
                script {
                    def isMaster = env.BRANCH_NAME == 'master'
                    def dockerImage = docker.build("$IMAGE_NAME:latest")

                    if (isMaster) {
                        docker.withRegistry('https://index.docker.io/v1/', 'dockerhub') {
                            dockerImage.push()
                        }
                    }
                }
            }
        }

        stage('Deploy to render with hook') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'master') {
                        sh "curl $RENDER_DEPLOY_HOOK_URL"
                    }
                }
            }
        }
    }

    post {
        always {
            sh "docker system prune -f"
        }
    }
}