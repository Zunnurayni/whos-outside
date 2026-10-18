import { CreateClient } from "./CreateClient";

export default function CreatePage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  return <CreateClient mapboxToken={mapboxToken} />;
}
