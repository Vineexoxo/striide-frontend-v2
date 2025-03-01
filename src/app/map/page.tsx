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
                        // Check if response is OK (status 200)
                if (!res.ok) {
                    const text = await res.text(); // Log response as text
                    console.error("Error fetching reports:", res.status);
                    return;
                }
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
                
                <div className="absolute -right-0 bottom-[168px] z-10 flex h-[144px] w-[80px] flex-col items-center justify-evenly rounded-l-[24px] bg-[#9f9f9f] bg-opacity-10 backdrop-blur-[20px] [filter:drop-shadow(4px_4px_4px_rgba(31,_25,_38,_0.30))_drop-shadow(-4px_-4px_4px_rgba(0,_0,_0,_0.25))]">
                     <Link
                        className="bg-primary-purple flex h-[44px] w-[44px] items-center justify-center rounded-[12px]"
                        href={"/feedback"}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="28"
                            height="28"
                            viewBox="0 0 28 28"
                            fill="none"
                        >
                            <path
                                d="M17 0C16.2044 0 15.4413 0.316071 14.8787 0.87868C14.3161 1.44129 14 2.20435 14 3V8C14 8.79565 14.3161 9.55871 14.8787 10.1213C15.4413 10.6839 16.2044 11 17 11V12.493C17 13.854 18.668 14.512 19.597 13.517L21.945 11H25C25.7956 11 26.5587 10.6839 27.1213 10.1213C27.6839 9.55871 28 8.79565 28 8V3C28 2.20435 27.6839 1.44129 27.1213 0.87868C26.5587 0.316071 25.7956 0 25 0H17ZM15 3C15 2.46957 15.2107 1.96086 15.5858 1.58579C15.9609 1.21071 16.4696 1 17 1H25C25.5304 1 26.0391 1.21071 26.4142 1.58579C26.7893 1.96086 27 2.46957 27 3V8C27 8.53043 26.7893 9.03914 26.4142 9.41421C26.0391 9.78929 25.5304 10 25 10H21.728C21.6593 9.99996 21.5914 10.014 21.5285 10.0414C21.4655 10.0688 21.4088 10.1088 21.362 10.159L18.866 12.834C18.7976 12.9075 18.7086 12.9587 18.6106 12.981C18.5127 13.0032 18.4103 12.9954 18.3168 12.9586C18.2233 12.9218 18.1431 12.8577 18.0866 12.7746C18.0301 12.6916 17.9999 12.5934 18 12.493V10.5C18 10.3674 17.9473 10.2402 17.8536 10.1464C17.7598 10.0527 17.6326 10 17.5 10H17C16.4696 10 15.9609 9.78929 15.5858 9.41421C15.2107 9.03914 15 8.53043 15 8V3ZM8.5 7C7.43913 7 6.42172 7.42143 5.67157 8.17157C4.92143 8.92172 4.5 9.93913 4.5 11C4.5 12.0609 4.92143 13.0783 5.67157 13.8284C6.42172 14.5786 7.43913 15 8.5 15C9.56087 15 10.5783 14.5786 11.3284 13.8284C12.0786 13.0783 12.5 12.0609 12.5 11C12.5 9.93913 12.0786 8.92172 11.3284 8.17157C10.5783 7.42143 9.56087 7 8.5 7ZM3.5 11C3.5 9.67392 4.02678 8.40215 4.96447 7.46447C5.90215 6.52678 7.17392 6 8.5 6C9.82608 6 11.0979 6.52678 12.0355 7.46447C12.9732 8.40215 13.5 9.67392 13.5 11C13.5 12.3261 12.9732 13.5979 12.0355 14.5355C11.0979 15.4732 9.82608 16 8.5 16C7.17392 16 5.90215 15.4732 4.96447 14.5355C4.02678 13.5979 3.5 12.3261 3.5 11ZM0 21C0 20.2044 0.316071 19.4413 0.87868 18.8787C1.44129 18.3161 2.20435 18 3 18H14C14.7956 18 15.5587 18.3161 16.1213 18.8787C16.6839 19.4413 17 20.2044 17 21V21.5C17 22.1 16.72 23.716 15.512 25.192C14.282 26.694 12.135 28 8.5 28C4.865 28 2.717 26.694 1.488 25.192C0.281 23.716 0 22.1 0 21.5V21ZM3 19C2.46957 19 1.96086 19.2107 1.58579 19.5858C1.21071 19.9609 1 20.4696 1 21V21.5C1 21.9 1.22 23.284 2.262 24.558C3.282 25.806 5.135 27 8.5 27C11.865 27 13.717 25.806 14.738 24.558C15.781 23.284 16 21.9 16 21.5V21C16 20.4696 15.7893 19.9609 15.4142 19.5858C15.0391 19.2107 14.5304 19 14 19H3Z"
                                fill="#FFF6FF"
                            />
                        </svg>
                    </Link>
                    <Link
                        href="/report"
                        className="bg-primary-purple flex h-[44px] w-[44px] items-center justify-center rounded-[12px]"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="26"
                            height="30"
                            viewBox="0 0 26 30"
                            fill="none"
                        >
                            <path
                                d="M13 29L21.4855 20.7988C23.1636 19.1768 24.3065 17.1102 24.7695 14.8604C25.2324 12.6107 24.9948 10.2787 24.0865 8.1595C23.1782 6.04028 21.6402 4.22896 19.6668 2.95458C17.6934 1.6802 15.3734 1 13 1C10.6266 1 8.30659 1.6802 6.33322 2.95458C4.35984 4.22896 2.82177 6.04028 1.9135 8.1595C1.00524 10.2787 0.767564 12.6107 1.23054 14.8604C1.69352 17.1102 2.83636 19.1768 4.51453 20.7988L13 29Z"
                                stroke="#FFF6FF"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M11 19.0012C11 18.7388 11.0517 18.4789 11.1522 18.2364C11.2528 17.9939 11.4001 17.7735 11.5858 17.5879C11.7715 17.4023 11.992 17.2551 12.2346 17.1546C12.4773 17.0542 12.7374 17.0025 13 17.0025C13.2626 17.0025 13.5227 17.0542 13.7654 17.1546C14.008 17.2551 14.2285 17.4023 14.4142 17.5879C14.5999 17.7735 14.7472 17.9939 14.8478 18.2364C14.9483 18.4789 15 18.7388 15 19.0012C15 19.5314 14.7893 20.0397 14.4142 20.4146C14.0391 20.7894 13.5304 21 13 21C12.4696 21 11.9609 20.7894 11.5858 20.4146C11.2107 20.0397 11 19.5314 11 19.0012ZM11.196 6.99875C11.1694 6.74659 11.1961 6.49165 11.2744 6.25047C11.3527 6.0093 11.4809 5.78727 11.6506 5.5988C11.8204 5.41033 12.0278 5.25963 12.2596 5.15647C12.4914 5.05331 12.7423 5 12.996 5C13.2497 5 13.5006 5.05331 13.7324 5.15647C13.9642 5.25963 14.1716 5.41033 14.3414 5.5988C14.5111 5.78727 14.6393 6.0093 14.7176 6.25047C14.7959 6.49165 14.8226 6.74659 14.796 6.99875L14.096 14.0084C14.0676 14.2801 13.9394 14.5317 13.7363 14.7146C13.5331 14.8975 13.2694 14.9987 12.996 14.9987C12.7226 14.9987 12.4589 14.8975 12.2557 14.7146C12.0526 14.5317 11.9244 14.2801 11.896 14.0084L11.196 6.99875Z"
                                fill="#FFF6FF"
                            />
                        </svg>
                    </Link>
                </div>

                
            </MapProvider>
        </main>
    );
}