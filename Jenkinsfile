pipeline {
    agent any

    tools{
        jdk 'jdk-17'
        maven 'my-maven'
        nodejs 'node-20'
    }

    stages {
        stage('Code and commit lint') {
            steps {
                script {
                    try {
                        bitbucketStatusNotify(buildState: 'INPROGRESS')
                        sh 'yarn install'
                        sh 'echo "$GIT_COMMIT_MESSAGE" | yarn commitlint --from=HEAD~1 --to=HEAD'
                        sh 'yarn run lint'
                        bitbucketStatusNotify(buildState: 'SUCCESSFUL')
                    } catch (Exception e) {
                        // Get the error message
                        def errorMessage = currentBuild.rawBuild.getLog(30).join('\n')
                        // Notify Bitbucket
                        bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${errorMessage}")
                        // bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${e}")
                        error("Stage failed with error: ${e}")
                    }
                }
            }
        }

        stage('Code analysing with sonarqube'){
            steps{
                script{
                    try {
                        bitbucketStatusNotify(buildState: 'INPROGRESS')
                        def scannerHome = tool 'sonar-scanner';
                        withSonarQubeEnv("my-sonar"){
                            sh "${scannerHome}/bin/sonar-scanner -Dproject.settings=sonar-project.properties"
                        }
                        bitbucketStatusNotify(buildState: 'SUCCESSFUL')
                    } catch (Exception e) {
                        // Get the error message
                        def errorMessage = currentBuild.rawBuild.getLog(30).join('\n')
                        // Notify Bitbucket
                        bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${errorMessage}")
                        // bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${e}")
                        error("Stage failed with error: ${e}")
                    }
                }
            }
        }

        stage('Build and deploy Docker image') {
            when {
                branch 'dev'
            }
            steps {
                script{
                    try {
                        bitbucketStatusNotify(buildState: 'INPROGRESS')
                        withDockerRegistry(credentialsId: 'dockerid', url: 'https://index.docker.io/v1/'){
                            sh 'echo "Build"'
                            sh 'docker build -t phatnguyen1812/thietkenhanh-be --progress=plain .'
                            sh 'docker push phatnguyen1812/thietkenhanh-be'
                            sh 'echo "Push"'
                        }
                        bitbucketStatusNotify(buildState: 'SUCCESSFUL')
                    } catch (Exception e) {
                        // Get the error message
                        def errorMessage = currentBuild.rawBuild.getLog(30).join('\n')
                        // Notify Bitbucket
                        bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${errorMessage}")
                        // bitbucketStatusNotify(buildState: 'FAILED', buildDescription: "Error message: ${e}")
                        error("Stage failed with error: ${e}")
                    }
                }
            }
        }
    }
}
