"use client";

import { Dispatch, SetStateAction, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import MapProvider from "@/contexts/MapProvider";
import Map from "@/components/Map";
import Reports from "@/components/reports/Reports";
import Geolocator from "@/components/Geolocator";
import Link from "next/link";
import { X, Menu } from "lucide-react";
import { Feature, Suggestion } from "@/lib/types";

const MapOptions = {
    latitude: 42.362,
    longitude: -71.057,
    zoom: 17,
};

export default function MapPage() {
    return (
        <Suspense fallback={<p className="text-center text-white">Loading map...</p>}>
            <MapPageContent />
        </Suspense>
    );
}

function MapPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [reports, setReports] = useState([]);
    const [queryPath, setQueryPath] = useState<number[][]>([]);
    const [mapboxPath, setMapBoxPath] = useState<number[][]>([]);
    const [userCoords, setUserCoords] = useState<number[]>([]);
    const [customCoords, setCustomCoords] = useState<number[][]>([]);
    const [geolocatorCoords, setGeolocatorCoords] = useState<number[]>([]);

    let defaultFeature: Feature = {
        geometry: { coordinates: [] },
        properties: { kind: "", full_address: "" },
    };

    const [originFeature, setOriginFeature] = useState<Feature>(defaultFeature);
    const [destinationFeature, setDestinationFeature] = useState<Feature>(defaultFeature);

    /** ✅ Check User Authentication */
    useEffect(() => {
        const checkUserAuthentication = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get-user`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const data = await response.json();
                if (!data.user || data.user.role !== "authenticated") {
                    router.push("/user/login");
                }
            } catch (error) {
                console.error("Error checking user authentication:", error);
            }
        };
        checkUserAuthentication();
    }, [router]);

    /** ✅ Fetch Reports */
    useEffect(() => {
        const getReports = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report_ids`);
                const data = await res.json();
                setReports(data.body.reports);
            } catch (error) {
                console.error("Error fetching reports:", error);
            }
        };
        getReports();
    }, []);

    /** ✅ Show Feedback Message */
    useEffect(() => {
        const messageMap: { [key: string]: string } = {
            draft_saved: "Report saved as draft",
            marked: "Report marked on Striide map",
            draft_discarded: "Draft discarded",
            feedback: "Feedback submitted successfully",
        };

        for (const key in messageMap) {
            if (searchParams.get(key) === "true") {
                setFeedbackMessage(messageMap[key]);
                setTimeout(() => setFeedbackMessage(null), 3500);
                break;
            }
        }
    }, [searchParams]);

    /** ✅ Fetch Route from Backend */
    useEffect(() => {
        if (!customCoords || customCoords.length < 2) return;

        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/query_route`, {
            method: "POST",
            headers: { Accept: "*/*", "Content-Type": "application/json" },
            body: JSON.stringify({ origin: customCoords[0], destination: customCoords[1] }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data?.status === 200) {
                    setQueryPath(data.body.striide_route);
                } else {
                    throw new Error("Invalid backend response");
                }
            })
            .catch((err) => console.error("Error querying backend:", err));

        setCustomCoords([]);
    }, [customCoords]);

    /** ✅ Fetch Walking Directions from Mapbox */
    useEffect(() => {
        if (!originFeature.geometry.coordinates.length || !destinationFeature.geometry.coordinates.length) return;

        const userCoords = originFeature.geometry.coordinates;
        const destinationCoords = destinationFeature.geometry.coordinates;

        fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${userCoords[0]},${userCoords[1]};${destinationCoords[0]},${destinationCoords[1]}?alternatives=true&geometries=geojson&overview=full&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`,
            { method: "GET", headers: { Accept: "*/*", "Content-Type": "application/json" } }
        )
            .then((res) => res.json())
            .then((data) => setMapBoxPath(data.routes[0]?.geometry.coordinates || []))
            .catch((err) => console.error("Error fetching Mapbox suggestions:", err));
    }, [originFeature, destinationFeature]);

    return (
        <main className="relative h-full w-full">
            <MapProvider>
                {/* Hamburger Menu */}
                <div className="absolute top-4 right-4 z-30">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Dropdown Menu */}
                <div className={`fixed top-0 left-0 w-full h-[35%] z-20 bg-white bg-opacity-20 backdrop-blur-lg transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-y-0" : "-translate-y-[110%]"}`}>
                    <div className="p-4 pt-16 space-y-4 flex flex-col items-center justify-center h-full">
                        <Link href="/angels" className="block text-white text-lg">Angels</Link>
                        <Link href="/drafts" className="block text-white text-lg">Saved Drafts</Link>
                        <a href="https://drive.google.com/file/d/10pFz5xM8TOq-OoxAtPsY2sQwAcGxOTDL/view?usp=sharing" target="_blank" rel="noopener noreferrer" className="block text-white text-lg">Terms and Conditions</a>
                    </div>
                </div>

                {/* App Header */}
                <div className="absolute top-4 left-4 z-20 font-inter">
                    <span className="font-bold italic text-[20px] text-white">Striide</span>
                </div>

                {/* Display Reports */}
                <Reports reports={reports} />

                {/* Display Maps */}
                <Map options={MapOptions} mapboxPath={mapboxPath} queryPath={queryPath} setUserCoords={setUserCoords} setCustomCoords={setCustomCoords} markerCoords={geolocatorCoords} />
                <Geolocator geolocatorCoords={geolocatorCoords} setGeolocatorCoords={setGeolocatorCoords} queryPath={mapboxPath} />

                {/* Feedback Message Modal */}
                {feedbackMessage && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                        <div className="bg-white px-4 py-2 rounded-md">
                            <p className="text-black">{feedbackMessage}</p>
                        </div>
                    </div>
                )}
            </MapProvider>
        </main>
    );
}
