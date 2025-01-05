import React, { useState, useEffect, lazy, Suspense } from "react";
import { openSource } from "../../portfolio";
import Contact from "../contact/Contact";
import Loading from "../loading/Loading";

const renderLoader = () => <Loading />;
const GithubProfileCard = lazy(() =>
  import("../../components/githubProfileCard/GithubProfileCard")
);

export default function Profile() {
  const [prof, setProf] = useState(null); // Use `null` as the initial state for clarity.

  useEffect(() => {
    if (openSource.showGithubProfile === "true") {
      const getProfileData = async () => {
        try {
          const response = await fetch(`${process.env.PUBLIC_URL}/profile.json?cacheBust=${Date.now()}`);
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          // Log response for debugging
          const data = await response.json();
          setProf(data.data.user); // Update the state with the user data
        } catch (error) {
          console.error(`${error} (because of this error GitHub contact section could not be displayed. Contact section has reverted to default)`);
          setProf("Error");
        }
      };
      getProfileData();
    }
  }, []); // No dependencies here to ensure it runs once on mount

  if (
    openSource.display &&
    openSource.showGithubProfile === "true" &&
    prof &&
    prof !== "Error"
  ) {
    return (
      <Suspense fallback={renderLoader()}>
        <GithubProfileCard prof={prof} key={prof.id} />
      </Suspense>
    );
  } else {
    return <Contact />;
  }
}
