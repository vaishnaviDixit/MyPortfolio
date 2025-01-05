import React, { useState, useEffect, useContext, Suspense, lazy } from "react";
import "./Project.scss";
import Button from "../../components/button/Button";
import { openSource, socialMediaLinks } from "../../portfolio";
import StyleContext from "../../contexts/StyleContext";
import Loading from "../../containers/loading/Loading";

export default function Projects() {
  const GithubRepoCard = lazy(() =>
    import("../../components/githubRepoCard/GithubRepoCard")
  );
  const renderLoader = () => <Loading />;
  const [repos, setRepos] = useState(null); // Use `null` as the initial state for clarity.
  const { isDark } = useContext(StyleContext);

  useEffect(() => {
    const getRepoData = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/profile.json?cacheBust=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Log response for debugging
        const data = await response.json();
        setRepos(data.data.user.pinnedItems.edges); // Set the repos data from the response
      } catch (error) {
        console.error(`${error} (because of this error, nothing is shown in place of Projects section. Also check if Projects section has been configured)`);
        setRepos("Error");
      }
    };
    getRepoData();
  }, []); // No dependencies here to ensure it runs once on mount

  if (repos && repos !== "Error" && openSource.display) {
    return (
      <Suspense fallback={renderLoader()}>
        <div className="main" id="opensource">
          <h1 className="project-title">Open Source Projects</h1>
          <div className="repo-cards-div-main">
            {repos.map((repo, index) => {
              if (!repo) {
                console.error(`Github Object for repository number ${index} is undefined`);
                return null;
              }
              return (
                <GithubRepoCard repo={repo} key={repo.node.id} isDark={isDark} />
              );
            })}
          </div>
          <Button
            text="More Projects"
            className="project-button"
            href={socialMediaLinks.github}
            newTab={true}
          />
        </div>
      </Suspense>
    );
  } else {
    return null; // Explicit fallback when repos are unavailable.
  }
}
