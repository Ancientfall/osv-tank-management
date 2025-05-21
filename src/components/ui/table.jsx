import React from 'react';

export const Table = ({ children }) => <table className="w-full border">{children}</table>;
export const Thead = ({ children }) => <thead className="bg-gray-100">{children}</thead>;
export const Tbody = ({ children }) => <tbody>{children}</tbody>;
export const Tr = ({ children }) => <tr className="border-b">{children}</tr>;
export const Th = ({ children }) => <th className="text-left p-2 font-medium">{children}</th>;
