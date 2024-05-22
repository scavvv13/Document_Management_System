function DocumentCard(props) {
  const { documentName, image, description } = props;
  return (
    <>
      <div className="flex">
        <div className="border border-gray-500 rounded-md p-3 shadow-md ">
          <img src={image} />
          <h2 className=" text-xl text-bold ">{documentName}</h2>
          <h5>{description}</h5>
        </div>
      </div>
    </>
  );
}

export default DocumentCard;
