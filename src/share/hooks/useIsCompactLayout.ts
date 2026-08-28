import useMediaQuery from "@mui/material/useMediaQuery";

// Navigation/overlays need more space than phone-only tracker defaults.
// Both iPad orientations use the same layout, preserving in-progress forms.
const useIsCompactLayout = () => useMediaQuery("(max-width: 1199px)");

export default useIsCompactLayout;
