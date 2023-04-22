import { Button, PanelHeader } from "@vkontakte/vkui";
import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export const HeaderBlock: React.FC = () => {
  const [firstRender, setFirstRender] = React.useState<boolean>(false);

  const location = useLocation();

  useEffect(() => {
    if (!firstRender) {
      setFirstRender(true);
    }
  }, []);

  useEffect(() => {}, []);

  return (
    <PanelHeader
      separator={false}
      className="delab-header-full delab-header"
      before={
        <img
          src={
            "https://ipfs.io/ipfs/bafkreigb3zknvo4tzdqttreowztwt6uxuahgcbmsf66cdtewz4wrc665yq"
          }
        />
      }
      after={<div></div>}
    >
      <div
        className="delab-header-btn"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          marginLeft: "10px",
        }}
      >
        <Link to="/">
          <Button
            size="l"
            mode="tertiary"
            className={location.pathname === "/" ? "delab-active" : ""}
          >
            Home
          </Button>
        </Link>
        <Link to="/farms">
          <Button
            size="l"
            mode="tertiary"
            className={
              location.pathname.indexOf("/farms") > -1 ? "delab-active" : ""
            }
          >
            Farms
          </Button>
        </Link>

        <Link to="/dex">
          <Button
            size="l"
            mode="tertiary"
            className={location.pathname === "/dex" ? "delab-active" : ""}
          >
            Dex
          </Button>
        </Link>

        <Link to="/">
          <Button
            size="l"
            mode="tertiary"
            className={location.pathname === "/team" ? "delab-active" : ""}
          >
            Team
          </Button>
        </Link>
      </div>
    </PanelHeader>
  );
};
