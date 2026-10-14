const ribbonPaths = [
  "M-60 10 C 70 2, 105 34, 205 21 S 350 4, 445 25 S 575 52, 685 24 S 845 4, 955 24 S 1115 52, 1235 25 S 1390 5, 1500 18",
  "M-60 23 C 55 45, 130 4, 235 19 S 370 44, 480 22 S 620 4, 735 22 S 880 48, 995 21 S 1140 5, 1260 22 S 1410 42, 1500 12",
  "M-60 35 C 55 18, 125 54, 235 34 S 375 14, 490 37 S 635 56, 750 32 S 890 14, 1005 37 S 1150 56, 1270 34 S 1410 18, 1500 38",
  "M-60 48 C 65 62, 135 29, 255 48 S 395 64, 510 44 S 655 25, 770 49 S 915 64, 1030 45 S 1170 27, 1295 49 S 1425 63, 1500 43",
  "M-60 62 C 65 43, 145 72, 270 58 S 410 42, 530 61 S 675 74, 795 58 S 945 43, 1060 62 S 1205 74, 1320 57 S 1430 49, 1500 63",
  "M-60 5 C 60 20, 120 0, 250 12 S 400 31, 530 10 S 690 0, 820 13 S 980 31, 1110 11 S 1300 1, 1500 15",
  "M-60 72 C 70 56, 145 76, 280 67 S 440 56, 570 71 S 735 77, 865 67 S 1030 57, 1170 71 S 1370 77, 1500 65",
  "M-60 29 C 40 8, 135 43, 250 29 S 385 9, 505 31 S 650 48, 765 28 S 910 9, 1030 31 S 1175 48, 1290 29 S 1420 12, 1500 26",
  "M-60 54 C 45 34, 130 69, 245 53 S 390 34, 510 55 S 660 72, 780 53 S 925 35, 1045 55 S 1190 72, 1310 53 S 1430 39, 1500 56",
  "M-60 16 C 70 36, 125 7, 260 20 S 410 37, 545 18 S 700 6, 835 21 S 995 37, 1130 19 S 1310 7, 1500 23",
]

function RibbonSvg({ variant = "primary" }: { variant?: "primary" | "secondary" }) {
  return (
    <svg className={`ribbon-svg ribbon-svg-${variant}`} viewBox="0 0 1440 76" preserveAspectRatio="none" aria-hidden="true">
      {ribbonPaths.map((path, index) => (
        <path key={`${variant}-${index}`} d={path} />
      ))}
    </svg>
  )
}

export default function HeaderRibbons() {
  return (
    <>
      <div className="header-ribbons" aria-hidden="true">
        <div className="header-ribbons-back">
          <RibbonSvg />
          <RibbonSvg variant="secondary" />
        </div>
      </div>
      <div className="header-ribbons-front" aria-hidden="true">
        <RibbonSvg variant="secondary" />
      </div>
    </>
  )
}
